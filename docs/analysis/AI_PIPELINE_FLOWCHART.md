# AI Pipeline Flowchart

```mermaid
flowchart TD
    subgraph "Start: /create"
        A[/"CreateStoryPage.tsx"/] --> B{Mode Selection};
    end

    B --> C[Easy Mode];
    B --> D[Template Mode];
    B --> E[Advanced Mode];

    subgraph "Easy Mode Flow"
        C --> C1[Select Length];
        C1 --> C2[Select Genre];
        C2 --> C3[Enter Character Details];
        C3 --> F{Generate Story};
    end

    subgraph "Template Mode Flow"
        D --> D1[Select Template];
        D1 --> F;
    end

    subgraph "Advanced Mode Flow"
        E --> E1[Step 1: Concept];
        E1 --> E2[Step 2: Characters];
        E2 --> E3[Step 3: Setting];
        E3 --> E4[Step 4: Plot];
        E4 --> E5[Step 5: Review];
        E5 --> F;
    end

    subgraph "Generation & Outcome"
        F -- "useCreateStory()" --> G{API Call};
        G -- Success --> H[Navigate to /stories/:id];
        G -- Error --> I[Display Error Message];
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px;
    style H fill:#9f9,stroke:#333,stroke-width:2px
    style I fill:#f99,stroke:#333,stroke-width:2px