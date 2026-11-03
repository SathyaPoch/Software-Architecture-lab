import {IsArray, IsNotEmpty, IsString} from 'class-validator';
export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
     customerName:string;
    @IsArray()
    items: string[];
}