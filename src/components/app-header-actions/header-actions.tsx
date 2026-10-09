import { sampleNotifications } from '@/config/sampleNotifications';
import { Notifications } from '../app-sidebar/notifications/notifications';

export function HeaderActions() {
  return <Notifications notifications={sampleNotifications} />;
}
