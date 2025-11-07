// SharePoint API Client using Microsoft Graph
// This module handles authentication and file downloads from SharePoint

import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import 'isomorphic-fetch'

interface SharePointConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  siteId: string
  siteName?: string
}

export class SharePointClient {
  private client: Client | null = null
  private config: SharePointConfig

  constructor(config: SharePointConfig) {
    this.config = config
  }

  // Initialize the Graph client with authentication
  private async initializeClient(): Promise<Client> {
    if (this.client) {
      return this.client
    }

    try {
      // Create credential using client secret
      const credential = new ClientSecretCredential(
        this.config.tenantId,
        this.config.clientId,
        this.config.clientSecret
      )

      // Initialize Graph client
      this.client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await credential.getToken(['https://graph.microsoft.com/.default'])
            return token?.token || ''
          }
        }
      })

      return this.client
    } catch (error) {
      console.error('Failed to initialize SharePoint client:', error)
      throw new Error('SharePoint authentication failed')
    }
  }

  // Get site information
  async getSiteInfo(): Promise<any> {
    const client = await this.initializeClient()
    try {
      const site = await client.api(`/sites/${this.config.siteId}`).get()
      return site
    } catch (error) {
      console.error('Failed to get site info:', error)
      throw error
    }
  }

  // List all folders in a drive
  async listFolders(drivePath: string = '/'): Promise<any[]> {
    const client = await this.initializeClient()
    try {
      const response = await client
        .api(`/sites/${this.config.siteId}/drive/root${drivePath === '/' ? '' : ':' + drivePath + ':' }/children`)
        .get()

      return response.value.filter((item: any) => item.folder)
    } catch (error) {
      console.error('Failed to list folders:', error)
      throw error
    }
  }

  // List all files in a folder
  async listFiles(folderPath: string): Promise<any[]> {
    const client = await this.initializeClient()
    try {
      const response = await client
        .api(`/sites/${this.config.siteId}/drive/root:${folderPath}:/children`)
        .get()

      return response.value.filter((item: any) => item.file)
    } catch (error) {
      console.error('Failed to list files:', error)
      throw error
    }
  }

  // Download a file as text/CSV
  async downloadFileAsText(filePath: string): Promise<string> {
    const client = await this.initializeClient()
    try {
      const response = await client
        .api(`/sites/${this.config.siteId}/drive/root:${filePath}:/content`)
        .get()

      return response
    } catch (error) {
      console.error('Failed to download file:', error)
      throw error
    }
  }

  // Download a file as binary (for Excel, PDF, etc.)
  async downloadFileAsBinary(filePath: string): Promise<ArrayBuffer> {
    const client = await this.initializeClient()
    try {
      const response = await client
        .api(`/sites/${this.config.siteId}/drive/root:${filePath}:/content`)
        .responseType('arraybuffer')
        .get()

      return response
    } catch (error) {
      console.error('Failed to download file:', error)
      throw error
    }
  }

  // Search for files by name
  async searchFiles(query: string): Promise<any[]> {
    const client = await this.initializeClient()
    try {
      const response = await client
        .api(`/sites/${this.config.siteId}/drive/root/search(q='${query}')`)
        .get()

      return response.value
    } catch (error) {
      console.error('Failed to search files:', error)
      throw error
    }
  }

  // Get specific folders we need for financial data
  async getFinancialDataFolders(): Promise<{
    rootFolders: any[]
    accountingFolder: any[]
    metropolitanFolder: any[]
    legalDocumentsFolder: any[]
    laurelMasterData: any[]
  }> {
    try {
      // First, let's see what's at the root level
      const rootFolders = await this.listFolders('/').catch(() => [])

      // Dive into the key financial folders
      const [accountingFolders, accountingFiles] = await Promise.all([
        this.listFolders('/MM folder/Accounting').catch(() => []),
        this.listFiles('/MM folder/Accounting').catch(() => [])
      ])

      const [metroFolders, metroFiles] = await Promise.all([
        this.listFolders('/MM folder/Metropolitan').catch(() => []),
        this.listFiles('/MM folder/Metropolitan').catch(() => [])
      ])

      const [legalFolders, legalFiles] = await Promise.all([
        this.listFolders('/MM folder/Legal Documents').catch(() => []),
        this.listFiles('/MM folder/Legal Documents').catch(() => [])
      ])

      const [laurelDataFolders, laurelDataFiles] = await Promise.all([
        this.listFolders('/Laurel_AG/Master Data').catch(() => []),
        this.listFiles('/Laurel_AG/Master Data').catch(() => [])
      ])

      return {
        rootFolders,
        accountingFolder: [...accountingFolders, ...accountingFiles],
        metropolitanFolder: [...metroFolders, ...metroFiles],
        legalDocumentsFolder: [...legalFolders, ...legalFiles],
        laurelMasterData: [...laurelDataFolders, ...laurelDataFiles]
      }
    } catch (error) {
      console.error('Failed to get financial data folders:', error)
      throw error
    }
  }

  // Download financial data from actual SharePoint locations
  async downloadFinancialData(): Promise<{
    accountingMaster: ArrayBuffer | null
    incomeFiles: any[]
    expenseFiles: any[]
    laurelForecast: ArrayBuffer | null
    metroForecast: ArrayBuffer | null
    laurelMasterData: ArrayBuffer | null
  }> {
    try {
      // Download the main accounting master file
      const accountingMaster = await this.downloadFileAsBinary('/MM folder/Accounting/Accounting master file.xlsx').catch(() => null)

      // List files in Income and Expense folders
      const incomeFiles = await this.listFiles('/MM folder/Accounting/Income files').catch(() => [])
      const expenseFiles = await this.listFiles('/MM folder/Accounting/Expense files').catch(() => [])

      // Download forecast files
      const laurelForecast = await this.downloadFileAsBinary('/MM folder/Accounting/Copy of Laurel forecast.xlsx').catch(() => null)
      const metroForecast = await this.downloadFileAsBinary('/MM folder/Accounting/Metropolitan forecast.xlsx').catch(() => null)

      // Download Laurel master data
      const laurelMasterData = await this.downloadFileAsBinary('/Laurel_AG/Master Data/Copy of Estimation Tool - Master Data 6.7.24 - Copy.xlsx').catch(() => null)

      return {
        accountingMaster,
        incomeFiles,
        expenseFiles,
        laurelForecast,
        metroForecast,
        laurelMasterData
      }
    } catch (error) {
      console.error('Failed to download financial data:', error)
      throw error
    }
  }

  // Download a specific file from a folder
  async downloadFileFromFolder(folderPath: string, fileName: string): Promise<ArrayBuffer> {
    return this.downloadFileAsBinary(`${folderPath}/${fileName}`)
  }
}

// Helper to create client from environment variables
export function createSharePointClient(): SharePointClient | null {
  const tenantId = process.env.AZURE_TENANT_ID || process.env.NEXT_PUBLIC_AZURE_TENANT_ID
  const clientId = process.env.AZURE_CLIENT_ID || process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  const siteId = process.env.SHAREPOINT_SITE_ID || process.env.NEXT_PUBLIC_SHAREPOINT_SITE_ID

  if (!tenantId || !clientId || !clientSecret || !siteId) {
    console.warn('SharePoint credentials not configured')
    return null
  }

  return new SharePointClient({
    tenantId,
    clientId,
    clientSecret,
    siteId
  })
}
