import logging

import requests

logger = logging.getLogger("uvicorn")


def download_image(url: str | None) -> bytes | None:
    if not url:
        return None
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            logger.error("Image download failed — status %d for %s", response.status_code, url)
            return None
        return response.content
    except Exception as e:
        logger.error("Image download error for %s: %s", url, e)
        return None
