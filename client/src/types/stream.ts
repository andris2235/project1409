export enum PresetTypes{
  first = 1,
  second = 2,
  third = 3,
  fourth = 4
}

export interface PresetItem{
  text: string
  type: PresetTypes
}