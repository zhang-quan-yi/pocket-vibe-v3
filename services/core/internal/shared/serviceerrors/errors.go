package serviceerrors

import "errors"

var (
	ErrProjectNotFound = errors.New("project not found")
	ErrFileNotFound    = errors.New("file not found")
	ErrInvalidFilePath = errors.New("invalid file path")
	ErrNoteNotFound    = errors.New("note not found")
)
