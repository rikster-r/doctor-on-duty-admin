import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { SupabaseClient } from '@supabase/supabase-js';
const expo = new Expo();

// SEND NOTIFICATION TO SPECIFIC USER
export const sendNotificationToUser = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: number,
  notificationData: {
    title: string;
    body: string;
  }
) => {
  try {
    // Get user's push tokens
    const userTokens = await getUserPushTokens(supabase, userId);
    if (userTokens.length === 0) {
      throw new Error(`Пуш-токены для пользователя ${userId} не найдены`);
    }
    // Create notification messages
    const messages: ExpoPushMessage[] = userTokens
      .filter((tokenData) => Expo.isExpoPushToken(tokenData.pushToken))
      .map((tokenData) => ({
        to: tokenData.pushToken,
        sound: 'default',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData ?? {},
        badge: 1,
        priority: 'high' as const,
      }));
    if (messages.length === 0) {
      throw new Error(
        `Нет действительных пуш-токенов для пользователя ${userId}`
      );
    }
    // Save in db - optional
    
    // Send notifications
    await sendPushNotifications(messages);
    return;
  } catch (error) {
    console.error('Ошибка при отправке уведомления пользователю:', error);
    throw error;
  }
};

export const getUserPushTokens = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: number
) => {
  const { data, error } = await supabase
    .from('notification_push_tokens')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data;
};

// SEND PUSH NOTIFICATIONS VIA EXPO
export const sendPushNotifications = async (
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> => {
  const chunks = expo.chunkPushNotifications(messages);
  const results: ExpoPushTicket[] = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      results.push(...ticketChunk);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Ошибка при отправке блока уведомлений:', error);
      results.push({
        status: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
  return results;
};
