# logger.py
import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

class AppLogger:
    def __init__(self, name=__name__):
        # Create logs directory if it doesn't exist
        self.LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
        os.makedirs(self.LOG_DIR, exist_ok=True)
        
        # Configure logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        
        # File handler with rotation (10MB per file, max 5 files)
        log_filename = os.path.join(self.LOG_DIR, f"app_{datetime.now().strftime('%Y-%m-%d')}.log")
        file_handler = RotatingFileHandler(
            log_filename,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        
        # Add handlers if they haven't been added before
        if not self.logger.handlers:
            self.logger.addHandler(console_handler)
            self.logger.addHandler(file_handler)
    
    def get_logger(self):
        return self.logger

# Create a default logger instance
logger = AppLogger().get_logger()

def get_logger(name=__name__):
    """
    Get a configured logger instance.
    Usage: 
    from logger import get_logger
    logger = get_logger(__name__)
    """
    return AppLogger(name).get_logger()