import logging
import sys

from app.config.settings import settings


def setup_logging() -> logging.Logger:
    """Configures structured-friendly standard logging for the agent service."""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    logger = logging.getLogger("cinepilot")
    logger.setLevel(log_level)
    
    # Avoid duplicate handlers if setup is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        
        # Simple high-signal format
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

logger = setup_logging()
