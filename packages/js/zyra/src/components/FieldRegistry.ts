import AddressField from './AddressField';
import ButtonInput from './ButtonInput';
import BasicInput from './BasicInput';
import CalendarInput from './CalendarInput';
import ColorSettingInput from './ColorSettingInput';
import Content from './Content';
import EndpointEditor from './EndpointEditor';
import EventCalendar from './EventCalendar';
import ExpandablePanel from './ExpandablePanel';
import FileInput from './FileInput';
import BlockBuilder from './BlockBuilder';
import MapProvider from './MapProvider';
import ItemList from './ItemList';
import Log from './Log';
import MultiCheckBox from './MultiCheckbox';
import MultiInputTable from './MultiInputTable';
import NestedComponent from './NestedComponent';
import NoticeField from './Notice';
import PrePostText from './PrePostText';
import Recaptcha from './Recaptcha';
import Section from './Section';
import SelectInput from './SelectInput';
import ShortCodeTable from './ShortCodeTable';
import SystemInfo from './SystemInfo';
import Tabs from './Tabs';
import TextArea from './TextArea';
import ChoiceToggle from './ChoiceToggle';
import { FieldComponent } from './types';
import RandomInputKeyGenerator from './RandomInputKeyGenerator';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  // BasicInput
  text: BasicInput,
  number: BasicInput,
  email: BasicInput,
  time: BasicInput,
  date: BasicInput,

  // SelectInput
  select: SelectInput,
  dropdown: SelectInput,
  'multi-select': SelectInput,
  creatable: SelectInput,
  'creatable-multi': SelectInput,

  // Content
  heading: Content,
  richtext: Content,

  // MultiCheckBox
  checkbox: MultiCheckBox,
  checkboxes: MultiCheckBox,

  // FileInput
  attachment: FileInput,
  image: FileInput,

  textarea: TextArea,

  preposttext: PrePostText,

  button: ButtonInput,

  nested: NestedComponent,


  section: Section,

  'multi-checkbox-table': MultiInputTable,

  'expandable-panel': ExpandablePanel,

  'choice-toggle': ChoiceToggle,

  'block-builder': BlockBuilder,

  'system-info': SystemInfo,

  tab: Tabs,

  log: Log,

  'calendar-input': CalendarInput,

  'event-calendar': EventCalendar,

  recaptcha: Recaptcha,

  address: AddressField,

  divider: Section,

  'color-setting': ColorSettingInput,

  'endpoint-editor': EndpointEditor,

  'shortcode-table': ShortCodeTable,

  itemlist: ItemList,

  'notice': NoticeField,

  'google_map': MapProvider,
  'mapbox': MapProvider,
  'random-input-key-generator': RandomInputKeyGenerator,
};
