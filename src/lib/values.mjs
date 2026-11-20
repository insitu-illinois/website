// The lab values show publicly only once they are published and no longer marked as proposed in /admin.
// Development builds always show them so the text can be reviewed.
import values from '../content/pages/values.json' with { type: 'json' };

export function showValues(dev = false, data = values) {
  return dev || (!data.draft && !data.proposed);
}
