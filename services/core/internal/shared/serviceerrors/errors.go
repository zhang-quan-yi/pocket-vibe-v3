package serviceerrors

import "errors"

var (
	ErrProjectNotFound = errors.New("project not found")
	ErrFileNotFound    = errors.New("file not found")
	ErrInvalidFilePath = errors.New("invalid file path")
	ErrNoteNotFound    = errors.New("note not found")
	ErrUnauthorized    = errors.New("unauthorized")
	ErrSessionExpired  = errors.New("session expired")
	ErrUserNotFound    = errors.New("user not found")
)
