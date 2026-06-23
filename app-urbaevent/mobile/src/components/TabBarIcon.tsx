import { AppIcon, type AppIconName } from './AppIcon';

export function TabBarIcon({
  name,
  color,
  size = 26,
}: {
  name: AppIconName;
  color: string;
  size?: number;
}) {
  return <AppIcon name={name} size={size} color={color} />;
}
