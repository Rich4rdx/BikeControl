import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteRequestDto, ClienteResponseDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly url = '/api/clientes';

  constructor(private http: HttpClient) {}

  listar(): Observable<ClienteResponseDto[]> {
    return this.http.get<ClienteResponseDto[]>(this.url);
  }

  buscarPorDocumento(documento: string): Observable<ClienteResponseDto> {
    return this.http.get<ClienteResponseDto>(`${this.url}/${documento}`);
  }

  registrar(dto: ClienteRequestDto): Observable<ClienteResponseDto> {
    return this.http.post<ClienteResponseDto>(this.url, dto);
  }
}
