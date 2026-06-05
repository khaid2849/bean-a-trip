import boto3
from botocore.client import Config as BotoConfig
from botocore.exceptions import ClientError

from app.core.config import settings

# Internal client — uses Docker-internal hostname for upload/delete operations.
_client = None

# Presigned URL client — uses the public-facing URL so browser-accessible
# presigned URLs are signed against the correct host. AWS v4 signatures
# include the Host header in their signing scope, so the client used to
# generate the URL must match the host the browser will use.
_presigned_client = None


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


def _get_presigned_client():
    global _presigned_client
    if _presigned_client is None:
        endpoint = settings.MINIO_PUBLIC_URL or f"http://{settings.MINIO_ENDPOINT}"
        _presigned_client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name="us-east-1",
        )
    return _presigned_client


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
    client = _get_presigned_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET, "Key": object_key},
        ExpiresIn=expiry,
    )


def delete_file(object_key: str):
    client = get_minio_client()
    if client:
        client.delete_object(Bucket=settings.MINIO_BUCKET, Key=object_key)
