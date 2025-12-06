export type ObjectDescriptor = {
  id: string
  name?: string
  type: string            // 'image', 'app', 'audio', 'code', 'purr', 'unknown'
  source: string          // dataSourceId
  data?: any              // structured data
  bin?: string            // base64, buffer
  component?: any
  componentType: 'vue' | 'react' | 'svelte' | 'custom'
}