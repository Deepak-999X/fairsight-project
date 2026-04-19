"""
FairSight AI — Logging Configuration
Structured logging for the application.
"""

import logging
import sys
from app.config import settings


def setup_logger(name: str = "fairsight") -> logging.Logger:
    """
    Create a configured logger instance.
    
    Args:
        name: Logger name
        
    Returns:
        Configured logger
    """
    logger = logging.getLogger(name)

    # Set level based on environment
    if settings.APP_ENV == "development":
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    # Console handler with formatting
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


# Default application logger
logger = setup_logger()
