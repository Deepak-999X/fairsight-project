"""
FairSight AI — Health Endpoint Tests
"""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test that health endpoint returns 200 with correct schema."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data
    assert "environment" in data


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test that root endpoint returns app info."""
    response = await client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "FairSight AI"
    assert data["version"] == "1.0.0"
    assert "docs" in data


@pytest.mark.asyncio
async def test_sample_datasets(client):
    """Test that sample datasets endpoint returns dataset list."""
    response = await client.get("/api/v1/datasets/samples")
    assert response.status_code == 200

    data = response.json()
    assert "datasets" in data
    assert len(data["datasets"]) == 3
    assert data["datasets"][0]["name"] == "adult_income"
