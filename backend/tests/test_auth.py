import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


@pytest.mark.asyncio
def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

