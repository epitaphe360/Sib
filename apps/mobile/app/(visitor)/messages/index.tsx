import { MessagesListScreen } from '../../../src/screens/MessagesListScreen';

export default function VisitorMessagesScreen({ embedded = false }: { embedded?: boolean }) {
  return <MessagesListScreen group="visitor" embedded={embedded} />;
}
