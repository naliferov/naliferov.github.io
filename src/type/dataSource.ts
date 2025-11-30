type DataSource = {
  id: string
  label: string
  kind: 'redis' | 'api'

  credentials?: {
    token?: string
  }

  list(): Promise<any[]>
  get(id: string): Promise<any|null>
  save(obj: any): Promise<void>
  remove(id: string): Promise<void>
}

export default DataSource