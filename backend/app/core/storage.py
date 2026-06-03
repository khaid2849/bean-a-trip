import boto3
from botocore.client import Config as BotoConfig
from botocore.exceptions import ClientError

from app.core.config import settings

_client = None


def get_minio_client():
    global _client
    if _client is None and settings.MINIO_ENDPOINT:
        _client = boto3.client(
            "s3",
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name="us-east-1",
        )
    return _client


def ensure_bucket_exists():
    client = get_minio_client()
    if not client:
        return
    try:
        client.head_bucket(Bucket=settings.MINIO_BUCKET)
    except ClientError:
        client.create_bucket(Bucket=settings.MINIO_BUCKET)


def upload_file(file_bytes: bytes, object_key: str, content_type: str = "application/octet-stream") -> str:
    client = get_minio_client()
    client.put_object(
        Bucket=settings.MINIO_BUCKET,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return object_key


def get_presigned_url(object_key: str, expiry: int = 604800) -> str:
    client = get_minio_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET, "Key": object_key},
        ExpiresIn=expiry,
    )
    # Replace internal docker hostname with public URL
    if settings.MINIO_ENDPOINT and settings.MINIO_PUBLIC_URL:
        internal = f"http://{settings.MINIO_ENDPOINT}"
        url = url.replace(internal, settings.MINIO_PUBLIC_URL)
    return url


def delete_file(object_key: str):
    client = get_minio_client()
    if client:
        client.delete_object(Bucket=settings.MINIO_BUCKET, Key=object_key)
