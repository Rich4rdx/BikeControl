import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BicicletaRequestDto, BicicletaResponseDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private readonly url = '/api/bicicletas';

  constructor(private http: HttpClient) {}

  listar(): Observable<BicicletaResponseDto[]> {
    return this.http.get<BicicletaResponseDto[]>(this.url);
  }

  obtenerPorId(id: number): Observable<BicicletaResponseDto> {
    return this.http.get<BicicletaResponseDto>(`${this.url}/${id}`);
  }

  crear(dto: BicicletaRequestDto): Observable<BicicletaResponseDto> {
    return this.http.post<BicicletaResponseDto>(this.url, dto);
  }
}
