from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/order_supervisor"

    # Temporal
    temporal_host: str = "localhost"
    temporal_port: int = 7233
    temporal_namespace: str = "default"
    temporal_task_queue: str = "order-supervisor"

    @property
    def temporal_address(self) -> str:
        return f"{self.temporal_host}:{self.temporal_port}"

    # Groq
    groq_api_key: str = ""
    groq_main_model: str = "llama-3.3-70b-versatile"
    groq_classifier_model: str = "llama-3.1-8b-instant"

    # Agent behaviour
    default_wakeup_interval_seconds: int = 300
    max_workflow_age_seconds: int = 604800

    # App
    app_env: str = "development"
    log_level: str = "INFO"


# Single shared instance — import this everywhere
settings = Settings()