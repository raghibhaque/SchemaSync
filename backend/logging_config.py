"""Structured JSON logging for SchemaSync."""

import json
import logging
import time


class _JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry: dict = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            entry["exc_info"] = self.formatException(record.exc_info)
        # Include any extra fields attached with logger.info("msg", extra={...})
        _SKIP = frozenset({
            "msg", "args", "levelname", "levelno", "pathname", "filename",
            "module", "exc_info", "exc_text", "stack_info", "lineno",
            "funcName", "created", "msecs", "relativeCreated", "thread",
            "threadName", "processName", "process", "name", "message",
            "taskName",
        })
        for k, v in record.__dict__.items():
            if k in _SKIP:
                continue
            try:
                json.dumps(v)
                entry[k] = v
            except (TypeError, ValueError):
                entry[k] = str(v)
        return json.dumps(entry, default=str)


def configure_logging(debug: bool = False) -> None:
    """Call once at application startup to configure root logger."""
    handler = logging.StreamHandler()
    handler.setFormatter(_JSONFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.DEBUG if debug else logging.INFO)

    # Quieten noisy libraries
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
