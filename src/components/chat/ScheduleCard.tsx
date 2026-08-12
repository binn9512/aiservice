import React from 'react';
import { Text, View } from 'react-native';

import { ScheduleEvent } from '../../types/chat';
import QuestionChip from '../modal/QuestionChip';
import styles from './scheduleCard.styles';

const CATEGORY_ICON: Record<string, string> = {
  date: '💕',
  office: '🏢',
  business: '💼',
  formal: '🎩',
  casual: '☕',
  outdoor: '🌳',
  exercise: '🏃',
  travel: '✈️',
  school: '📚',
  dining: '🍽️',
  medical: '🏥',
  home: '🏠',
  unknown: '📅',
};

const formatTime = (event: ScheduleEvent) => {
  if (event.allDay) {
    return '종일';
  }
  // start는 백엔드가 Asia/Seoul 오프셋을 포함해 내려주므로 문자열에서 바로 잘라 사용
  return event.start?.slice(11, 16) ?? '';
};

type Props = {
  dateLabel: string | null;
  events: ScheduleEvent[];
  clarifyingQuestion?: string | null;
  suggestedActions?: string[];
  transitionPlan?: string[] | null;
  onActionPress: (prompt: string) => void;
};

const ScheduleCard = ({
  dateLabel,
  events,
  clarifyingQuestion,
  suggestedActions,
  transitionPlan,
  onActionPress,
}: Props) => {
  return (
    <View style={styles.card}>
      {dateLabel && <Text style={styles.dateLabel}>{dateLabel} 일정</Text>}

      {events.map((event, index) => (
        <View key={`${event.title}-${index}`} style={styles.eventRow}>
          <Text style={styles.eventIcon}>
            {CATEGORY_ICON[event.category ?? 'unknown'] ?? '📅'}
          </Text>
          <View style={styles.eventTextWrap}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventMeta}>
              {formatTime(event)}
              {event.location ? ` · ${event.location}` : ''}
            </Text>
          </View>
        </View>
      ))}

      {!!transitionPlan?.length && (
        <View style={styles.transitionWrap}>
          <Text style={styles.transitionTitle}>전환 코디 제안</Text>
          {transitionPlan.map((step, index) => (
            <Text key={index} style={styles.transitionStep}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      )}

      {!!clarifyingQuestion && (
        <Text style={styles.transitionStep}>{clarifyingQuestion}</Text>
      )}

      {!!suggestedActions?.length && (
        <View style={styles.chipRow}>
          {suggestedActions.map((action, index) => (
            <View key={index} style={{ marginRight: 8 }}>
              <QuestionChip text={action} onPress={() => onActionPress(action)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ScheduleCard;
