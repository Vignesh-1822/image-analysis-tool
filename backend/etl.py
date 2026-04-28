import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

from database import SessionLocal
from models.database_models import SKU

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def load_light_metadata(path: str) -> dict[str, dict]:
    with open(path) as f:
        light_data = json.load(f)
    return {item["ItemNumber"]: item for item in light_data}


def load_full_metadata(folder: str) -> dict[str, dict]:
    full_by_item_number: dict[str, dict] = {}
    for file in Path(folder).glob("*.json"):
        try:
            with open(file) as f:
                entries = json.load(f)
            for entry in entries:
                try:
                    parsed = json.loads(entry["ProductJSON"])
                    item_number = parsed["Attributes"].get("POS_Item_Num")
                    if item_number:
                        full_by_item_number[item_number] = parsed
                except Exception as e:
                    logger.error("Failed to parse entry in %s: %s", file.name, e)
        except Exception as e:
            logger.error("Failed to read file %s: %s", file.name, e)
    return full_by_item_number


def run_etl(light_path: str, full_folder: str) -> None:
    logger.info("Loading light metadata...")
    light_by_item_number = load_light_metadata(light_path)

    logger.info("Loading full metadata...")
    full_by_item_number = load_full_metadata(full_folder)

    inserted = 0
    skipped = 0
    no_match = 0

    BATCH_SIZE = 500

    db: Session = SessionLocal()
    try:
        for item_number, full in full_by_item_number.items():
            light = light_by_item_number.get(item_number)
            if light is None:
                logger.info("No light match for %s", item_number)
                no_match += 1
                continue

            try:
                exists = db.query(SKU).filter(
                    SKU.item_number == item_number
                ).first()
                if exists:
                    skipped += 1
                    continue

                sku = SKU(
                    item_number=item_number,
                    sku_id=full.get("Id"),
                    long_description=light.get("LongDescription"),
                    primary_color=full["Attributes"].get("ATT_Primary_Color"),
                    marketing_color=full["Attributes"].get("ATT_Mfg_Color_Name"),
                    hierarchy=light.get("HierarchyId"),
                    taxonomy_path=full["Attributes"].get("TaxonomyPath"),
                    image_link=light.get("PrimaryImageLink"),
                    light_data=dict(light),
                    full_data=dict(full),
                )
                db.add(sku)
                inserted += 1

                if inserted % BATCH_SIZE == 0:
                    db.commit()
                    logger.info("Committed %d rows...", inserted)

            except Exception as e:
                db.expunge_all()
                logger.error("Failed to insert %s: %s", item_number, e)

        db.commit()

    finally:
        db.close()

    print(
        f"ETL complete. "
        f"Inserted: {inserted}, "
        f"Skipped: {skipped}, "
        f"No match: {no_match}"
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python etl.py <light_metadata.json> <full_metadata_folder>")
        sys.exit(1)

    run_etl(sys.argv[1], sys.argv[2])