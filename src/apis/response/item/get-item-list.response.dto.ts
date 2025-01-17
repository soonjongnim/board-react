import { ItemListItem } from 'types/interface';
import ResponseDto from '../response.dto';

export default interface GetItemListResponseDto extends ResponseDto {
    itemList: ItemListItem[];
}