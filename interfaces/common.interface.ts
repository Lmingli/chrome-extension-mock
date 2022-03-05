export interface StorageAll {
  setting?: StorageSetting;
  [url: string]: any;
}

interface CommonSettingItem {
  limit: number | null;
  checkParams: boolean;
  checkBody: boolean;
  removeRequestUrlParams: string[];
  removeRequestBodyParams: string[];
}

export interface StorageSetting extends CommonSettingItem {
  openSave: boolean;
  openMock: boolean;
  openUrl: string;
  listUrlRemoveStr: string;
  filterUrl: string[];
  [prop: string]: any;
};

export interface StorageItem extends CommonSettingItem {
  data: Array<StorageItemData>;
  timestamp: number;
  url: string;
  top?: boolean;
  name?: string;
  compare?: boolean;
}

export interface StorageItemData {
  method: string;
  requestParams: string;
  requestBody: string;
  response: string;
  name: string;
  timestamp: number;
  active: boolean;
  [prop: string]: any;
}
