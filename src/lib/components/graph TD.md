graph TD
    A[App] --> B[Editor]
    A --> C[NoteList]
    B --> D[MarkdownEditor]
    B --> E[TimestampManager]
    D --> F[PocketBase API]
    E --> F
    C --> F
    F --> G[(PocketBase DB)]
    H[FileSystem] <--> B