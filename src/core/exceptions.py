from fastapi import status

class PanoERPException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str | None = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)

class NotFoundError(PanoERPException):
    def __init__(self, entity: str, identifier: str | int) -> None:
        super().__init__(
            message=f"{entity} bulunamadı: {identifier}",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
        )
