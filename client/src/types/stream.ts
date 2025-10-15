export enum PresetTypes{
  first = 1,
  second = 2,
  third = 3,
  fourth = 4
}
export enum SecondPresetTypes{
  first = "operationFirst",
  second = "operationSecond",
  third = "operationThird",
  fourth = "operationFourth"
}

export interface PresetItem{
  text: string
  type: PresetTypes
  secondText?: string
}

export interface SecondPresetItem{
  text: string
  type: SecondPresetTypes
}