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