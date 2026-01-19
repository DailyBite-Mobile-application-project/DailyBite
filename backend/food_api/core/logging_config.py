import logging
import os


def configure_logging() -> None:
    """Configure root logging.

    In cloud deployments, logs are typically collected from stdout/stderr.
    This configuration keeps handlers simple and compatible.
    """

    level_name = os.getenv("LOG_LEVEL", "INFO").upper().strip()
    level = getattr(logging, level_name, logging.INFO)

    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
