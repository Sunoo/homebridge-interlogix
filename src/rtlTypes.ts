export type rtlMessage = {
  time: string,
  model: string,
  subtype: string,
  id: string,
  battery_ok: (0 | 1),
  switch1: ('OPEN' | 'CLOSED'),
  switch2: ('OPEN' | 'CLOSED'),
  switch3: ('OPEN' | 'CLOSED'),
  switch4: ('OPEN' | 'CLOSED'),
  switch5: ('OPEN' | 'CLOSED'),
  raw_message: string
};