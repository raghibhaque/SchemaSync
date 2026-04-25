import axios, { AxiosInstance } from 'axios'
import type {
  UploadResponse,
  ReconcileStartResponse,
  ReconcileStatusResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Upload two schema files for reconciliation
   */
  async uploadSchemas(
    schemaA: File,
    schemaB: File
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('schema_a', schemaA)
    formData.append('schema_b', schemaB)

    const response = await this.client.post<UploadResponse>(
      '/api/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  /**
   * Run demo reconciliation with built-in Ghost + WordPress schemas
   */
  async uploadDemo(): Promise<UploadResponse> {
    const response = await this.client.post<UploadResponse>('/api/upload/demo')
    return response.data
  }

  /**
   * Start reconciliation job for a session
   */
  async startReconciliation(sessionId: string): Promise<ReconcileStartResponse> {
    const response = await this.client.post<ReconcileStartResponse>(
      `/api/reconcile/${sessionId}`
    )
    return response.data
  }

  /**
   * Poll reconciliation status and get result when complete
   */
  async getReconciliationStatus(
    jobId: string
  ): Promise<ReconcileStatusResponse> {
    const response = await this.client.get<ReconcileStatusResponse>(
      `/api/reconcile/status/${jobId}`
    )
    return response.data
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health')
    return response.data
  }
}

export const apiClient = new APIClient()
export default apiClient
