import _ from 'lodash';
import { CascaderOption } from '@grafana/ui';
import { PromMetricsMetadata } from '../types';
import { RECORDING_RULES_GROUP } from '../components/PromQueryField';

// See: https://github.com/microsoft/TypeScript/issues/20595#issuecomment-587297818
const postMessage = ((self as unknown) as Worker).postMessage;

onmessage = function({ data }) {
  const { metrics, metadata } = data;
  postMessage(groupMetricsByPrefix(metrics, metadata));
};

function addMetricsMetadata(metric: string, metadata?: PromMetricsMetadata): CascaderOption {
  const option: CascaderOption = { label: metric, value: metric };
  if (metadata && metadata[metric]) {
    const { type = '', help } = metadata[metric][0];
    option.title = [metric, type.toUpperCase(), help].join('\n');
  }
  return option;
}

function groupMetricsByPrefix(metrics: string[], metadata?: PromMetricsMetadata): CascaderOption[] {
  // Filter out recording rules and insert as first option
  const ruleRegex = /:\w+:/;
  const ruleNames = metrics.filter(metric => ruleRegex.test(metric));
  const rulesOption = {
    label: 'Recording rules',
    value: RECORDING_RULES_GROUP,
    children: ruleNames
      .slice()
      .sort()
      .map(name => ({ label: name, value: name })),
  };

  const options = ruleNames.length > 0 ? [rulesOption] : [];

  const delimiter = '_';
  const metricsOptions = _.chain(metrics)
    .filter((metric: string) => !ruleRegex.test(metric))
    .groupBy((metric: string) => metric.split(delimiter)[0])
    .map(
      (metricsForPrefix: string[], prefix: string): CascaderOption => {
        const prefixIsMetric = metricsForPrefix.length === 1 && metricsForPrefix[0] === prefix;
        const children = prefixIsMetric ? [] : metricsForPrefix.sort().map(m => addMetricsMetadata(m, metadata));
        return {
          children,
          label: prefix,
          value: prefix,
        };
      }
    )
    .sortBy('label')
    .value();

  return [...options, ...metricsOptions];
}
