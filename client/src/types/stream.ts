export enum PresetTypes{
  first,
  second,
  third,
  fourth
}

export interface PresetItem{
  text: string
  type: PresetTypes
}