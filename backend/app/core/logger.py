import logging
import sys

def setup_logger(name: str) -> logging.Logger:
    """Set up and return a configured logger."""
    logger = logging.getLogger(name)
    
    # Only configure if the logger doesn't already have handlers
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Create formatter and add it to the handler
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        
        # Add the handler to the logger
        logger.addHandler(console_handler)
        
    return logger

# Create a root logger for the app that can be imported directly
logger = setup_logger("ai_inventory")
