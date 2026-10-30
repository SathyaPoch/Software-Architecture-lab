import { IsIn} from 'class-validator';
export class UpdateOrderDto{
@IsIn(['PLACED', 'COOKING' ,'DELIVERING','CANCELLED'])
status : string
}