import logging


def get_logger(name: str = "backend") -> logging.Logger:
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # ⬅️ zapobiega duplikacji

    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    return logger

