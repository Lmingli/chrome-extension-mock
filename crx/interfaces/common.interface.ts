export interface StorageAll {
  setting?: StorageSetting;
}

export interface StorageSetting {
  openSave: boolean;
  openMock: boolean;
  openUrl: string;
  limit: number;
  checkParams: boolean;
  checkBody: boolean;
  removeRequestUrlParams: string[];
  removeRequestBodyParams: string[];
  listUrlRemoveStr: string;
  filterUrl: string[];
};

export interface StorageItem {
  data: Array<StorageItemData>;
  timestamp: number;
  url: string;
  top?: boolean;
  name?: string;
  compare?: boolean;
  limit?: number;
  checkParams?: boolean;
  checkBody?: boolean;
  removeRequestUrlParams?: string[];
  removeRequestBodyParams?: string[];
}

export interface StorageItemData {
  method: string;
  requestParams: string;
  requestBody: string;
  response: string;
  name: string;
  timestamp: number;
  active: boolean;
}
