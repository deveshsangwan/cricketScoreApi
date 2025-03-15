type ResponseBody = { [key: string]: any; status?: boolean };

export interface IApiResponse {
    body: ResponseBody;
    status: number;
}
