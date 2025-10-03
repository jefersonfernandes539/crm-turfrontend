export interface RequestParametersInterface {
  pageNumber: number;
  pageSize: number;
  orderBy?: string | null;
  searchTerm?: string | null;
}
