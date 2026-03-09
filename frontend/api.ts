// api.ts — Backend API client
const API_BASE = "/api";

export interface ActivityImage {
    id: string;
    url: string;
    truth: string;
}

export interface ModelPrediction {
    label: "CHAT" | "PAS_CHAT" | "INCERTAIN";
    confidence: number;
    stability?: "STABLE" | "FRAGILE" | "CASSE";
}

export interface PredictionResponse {
    truth: string;
    model_a: ModelPrediction;
    model_b: ModelPrediction;
    transformed_base64?: string;
}

export async function fetchAllImages(): Promise<ActivityImage[]> {
    const res = await fetch(`${API_BASE}/activity/images`);
    if (!res.ok) throw new Error("Failed to fetch images");
    return res.json();
}

export async function fetchLookAlikeImages(): Promise<ActivityImage[]> {
    const res = await fetch(`${API_BASE}/activity/lookalike`);
    if (!res.ok) throw new Error("Failed to fetch lookalike images");
    return res.json();
}

export interface TrainingSample {
    url: string;
    label: string;
}

export async function fetchTrainingSamples(): Promise<{ model_a: TrainingSample[], model_b: TrainingSample[] }> {
    const res = await fetch(`${API_BASE}/training-samples`);
    if (!res.ok) throw new Error("Failed to fetch training samples");
    return res.json();
}

export async function fetchPredictions(imageId: string): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) throw new Error("Failed to fetch predictions");
    return res.json();
}

export async function fetchTransformedPredictions(
    imageId: string,
    transforms: string[]
): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, transforms }),
    });
    if (!res.ok) throw new Error("Failed to fetch transformed predictions");
    return res.json();
}

export interface LabInfoResponse {
    levels: number[];
    chat_pool: number;
    pas_chat_pool: number;
    max_train_size: number;
    current_model: {
        trained: boolean;
        dataset_size: number;
        train_accuracy: number;
        val_accuracy: number;
    };
}

export interface LabTrainResponse {
    trained_on: number;
    requested_size: number;
    train_accuracy: number;
    val_accuracy: number;
}

export interface LabPredictResponse {
    truth: "CHAT" | "PAS_CHAT";
    model: {
        label: "CHAT" | "PAS_CHAT";
        confidence: number;
    };
    trained_on: number;
}

export async function fetchLabInfo(): Promise<LabInfoResponse> {
    const res = await fetch(`${API_BASE}/lab/info`);
    if (!res.ok) throw new Error("Failed to fetch lab info");
    return res.json();
}

export async function trainLabModel(datasetSize: number): Promise<LabTrainResponse> {
    const res = await fetch(`${API_BASE}/lab/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_size: datasetSize }),
    });
    if (!res.ok) throw new Error("Failed to train lab model");
    return res.json();
}

export async function fetchLabPrediction(imageId: string): Promise<LabPredictResponse> {
    const res = await fetch(`${API_BASE}/lab/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) throw new Error("Failed to fetch lab prediction");
    return res.json();
}
