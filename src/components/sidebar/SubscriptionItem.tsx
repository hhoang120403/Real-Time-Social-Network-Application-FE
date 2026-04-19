import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar';

interface SubscriptionItemProps {
  name: string;
  image: string;
  alt?: string;
}

const SubscriptionItem = ({ name, image, alt = name }: SubscriptionItemProps) => {
  return (
    <div className="flex cursor-pointer items-center gap-4 rounded-xl px-[10px] py-[9px] hover:bg-gray-100 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={image} alt={alt} className="object-cover" />
        <AvatarFallback className="bg-blue-500 text-white text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
      {/* Badge indicating online status like in the snippet */}
      <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-blue-500"></div>
    </div>
  );
};

export default SubscriptionItem;
