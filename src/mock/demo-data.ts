// Пример данных для демо app-shell. Без калорий, граммов нутриентов, веса и ИМТ.

export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface Dish {
  name: string
  time: number
  tags: string[]
  why: string
}

export const dishes = {
  oatmeal: {
    name: 'Овсянка с ягодами и орехами',
    time: 10,
    tags: ['быстро', 'вегетарианское'],
    why: 'Овсянка с ягодами и орехами готовится за 10 минут и подходит под вашу цель «больше энергии днём». Орехи добавляют белок и жиры, ягоды — вкус без лишнего сахара. В профиле нет ограничений на эти продукты.',
  },
  omelette: {
    name: 'Омлет со шпинатом и тостом',
    time: 12,
    tags: ['быстро', 'из того, что есть'],
    why: 'Яйца и шпинат уже есть у вас дома, так что ничего докупать не нужно. Омлет сытный и готовится на одной сковороде — удобно в будний день.',
  },
  toast: {
    name: 'Тост с авокадо и яйцом',
    time: 8,
    tags: ['быстро'],
    why: 'Самый быстрый вариант завтрака из плана. Вы отмечали, что любите авокадо, а яйцо добавит сытости до обеда.',
  },
  yogurtBowl: {
    name: 'Растительный йогурт с гранолой',
    time: 3,
    tags: ['быстро', 'без лактозы', 'проще простого'],
    why: 'Готовить ничего не нужно: всё собирается в тарелке за пару минут. Йогурт на растительной основе — с учётом вашего ограничения «без лактозы».',
  },
  buckwheatBowl: {
    name: 'Боул с гречкой, курицей и овощами',
    time: 25,
    tags: ['можно взять с собой'],
    why: 'Гречку и курицу удобно приготовить вечером и взять на работу. Овощи дают хруст и цвет, а гречка — спокойную сытость на вторую половину дня.',
  },
  lentilSoup: {
    name: 'Чечевичный суп с томатами',
    time: 30,
    tags: ['вегетарианское', 'на два дня'],
    why: 'Суп готовится один раз на два дня — так вы экономите время в четверг перед поездкой. Чечевица — хороший растительный источник белка.',
  },
  wrap: {
    name: 'Лаваш с хумусом и овощами',
    time: 10,
    tags: ['быстро', 'вегетарианское'],
    why: 'Собирается за 10 минут и не требует плиты. Хумус и овощи хорошо сочетаются и легко переносят дорогу.',
  },
  pantryPasta: {
    name: 'Паста с томатами и фасолью',
    time: 15,
    tags: ['из того, что есть'],
    why: 'Собрано из того, что обычно лежит в шкафу: паста, консервированные томаты и фасоль. Ничего покупать не нужно — хороший вариант для пустого холодильника.',
  },
  salmon: {
    name: 'Лосось с картофелем и брокколи',
    time: 30,
    tags: ['на ужин'],
    why: 'Рыба в плане раз в неделю — вы отметили, что хотите есть разнообразнее. Всё запекается на одном противне, посуды минимум.',
  },
  stirFry: {
    name: 'Овощной вок с тофу',
    time: 20,
    tags: ['вегетарианское', 'быстро'],
    why: 'Вок готовится быстрее, чем едет доставка. Тофу хорошо впитывает соус, а овощи можно брать любые, что есть дома.',
  },
  chickenRice: {
    name: 'Курица терияки с рисом',
    time: 25,
    tags: ['любят дети'],
    why: 'Мягкий сладковатый вкус нравится всей семье. Рис можно сварить с запасом и использовать завтра в боуле.',
  },
  quickEggs: {
    name: 'Шакшука за 15 минут',
    time: 15,
    tags: ['быстро', 'из того, что есть'],
    why: 'Нет времени — не проблема: яйца, томаты и специи на одной сковороде. Подходит и на ужин, и на поздний завтрак.',
  },
  syrniki: {
    name: 'Сырники со сметаной',
    time: 20,
    tags: ['выходной'],
    why: 'В выходной есть время на неспешный завтрак. Вы отмечали сырники как любимое блюдо из детства.',
  },
  pilaf: {
    name: 'Плов с курицей',
    time: 50,
    tags: ['выходной', 'на два дня'],
    why: 'Воскресное блюдо, которое готовится почти без вашего участия. Остаток пригодится на обед в понедельник.',
  },
  guestsDinner: {
    name: 'Запечённая курица с овощами на 6 персон',
    time: 60,
    tags: ['для гостей', 'на 6 персон'],
    why: 'Пришли гости — план подстроился. Курица с овощами запекается целиком, пока вы общаетесь, а ингредиенты уже добавлены в список покупок.',
  },
  tripSnack: {
    name: 'Перекус в дорогу: орехи и фрукты',
    time: 5,
    tags: ['в дорогу'],
    why: 'В пятницу вы в поездке, поэтому вместо готовки — простой перекус, который легко взять с собой.',
  },
} satisfies Record<string, Dish>

export type DishId = keyof typeof dishes

/** Альтернативы для кнопки «Заменить» (цикл из 3). */
export const todayAlternatives: Record<MealSlot, DishId[]> = {
  breakfast: ['oatmeal', 'omelette', 'toast'],
  lunch: ['buckwheatBowl', 'lentilSoup', 'wrap'],
  dinner: ['salmon', 'stirFry', 'chickenRice'],
}

/** Что меняет каждая быстрая правка. */
export const quickEdits = {
  noTime: { slot: 'dinner', dish: 'quickEggs' },
  emptyFridge: { slot: 'lunch', dish: 'pantryPasta' },
  simpler: { slot: 'breakfast', dish: 'yogurtBowl' },
  guests: null,
} satisfies Record<string, { slot: MealSlot; dish: DishId } | null>

export type QuickEdit = keyof typeof quickEdits

/** 7 дней × 3 приёма пищи. Индекс 2 — среда (сегодня). */
export const week: Record<MealSlot, DishId>[] = [
  { breakfast: 'oatmeal', lunch: 'pilaf', dinner: 'stirFry' },
  { breakfast: 'toast', lunch: 'buckwheatBowl', dinner: 'chickenRice' },
  { breakfast: 'oatmeal', lunch: 'buckwheatBowl', dinner: 'salmon' },
  { breakfast: 'omelette', lunch: 'lentilSoup', dinner: 'quickEggs' },
  { breakfast: 'yogurtBowl', lunch: 'lentilSoup', dinner: 'tripSnack' },
  { breakfast: 'syrniki', lunch: 'wrap', dinner: 'pantryPasta' },
  { breakfast: 'syrniki', lunch: 'stirFry', dinner: 'pilaf' },
]

export const TODAY_INDEX = 2
export const TRIP_DAYS = [3, 4]
export const GUESTS_DAY = 5
export const GUESTS_DISH: DishId = 'guestsDinner'

export const shopping = [
  {
    group: 'Овощи и фрукты',
    items: [
      { id: 'broccoli', name: 'Брокколи', qty: '1 кочан' },
      { id: 'spinach', name: 'Шпинат', qty: '1 пучок', atHome: true },
      { id: 'tomatoes', name: 'Томаты', qty: '6 шт' },
      { id: 'berries', name: 'Ягоды замороженные', qty: '1 пачка' },
      { id: 'avocado', name: 'Авокадо', qty: '2 шт' },
    ],
  },
  {
    group: 'Молочное',
    items: [
      { id: 'eggs', name: 'Яйца', qty: '10 шт', atHome: true },
      { id: 'yogurt', name: 'Растительный йогурт', qty: '2 шт' },
      { id: 'cottage', name: 'Творог безлактозный', qty: '1 пачка' },
    ],
  },
  {
    group: 'Крупы',
    items: [
      { id: 'oats', name: 'Овсяные хлопья', qty: '1 пачка', atHome: true },
      { id: 'buckwheat', name: 'Гречка', qty: '1 пачка' },
      { id: 'rice', name: 'Рис', qty: '1 пачка' },
    ],
  },
  {
    group: 'Бакалея',
    items: [
      { id: 'lentils', name: 'Чечевица красная', qty: '1 пачка' },
      { id: 'hummus', name: 'Хумус', qty: '1 банка' },
      { id: 'nuts', name: 'Грецкие орехи', qty: '1 пачка', atHome: true },
    ],
  },
]

export const contextCards = [
  { key: 'time', label: 'Время на готовку в будни', value: 'до 30 мин' },
  { key: 'family', label: 'Семья', value: '3 человека' },
  { key: 'trip', label: 'Поездка', value: 'чт–пт' },
  { key: 'budget', label: 'Бюджет', value: 'умеренный' },
] as const

export const history = {
  liked: ['Овсянка с ягодами и орехами', 'Курица терияки с рисом', 'Тост с авокадо и яйцом', 'Овощной вок с тофу'],
  disliked: ['Суп-пюре из тыквы', 'Киноа с запечённой свёклой'],
}

export const learnArticles = [
  {
    key: 'protein',
    title: 'Зачем белок на завтрак',
    text: 'Белок помогает дольше оставаться сытым, поэтому завтрак с яйцами, творогом или орехами часто держит до обеда. Не нужно ничего считать — достаточно, чтобы в тарелке был хотя бы один такой продукт.',
  },
  {
    key: 'plate',
    title: 'Как собрать сбалансированную тарелку',
    text: 'Простой ориентир: половина тарелки — овощи, четверть — крупы или хлеб, четверть — белковый продукт. Это не правило, а подсказка, с которой удобно начинать.',
  },
  {
    key: 'label',
    title: 'Как читать состав продукта',
    text: 'Ингредиенты перечислены по убыванию количества. Если в начале списка то, что вы ожидаете увидеть, — это хороший знак. Короткий понятный состав обычно проще оценить.',
  },
]

export const profile = {
  goals: ['Больше энергии днём', 'Готовить дома чаще'],
  tastes: ['Азиатская кухня', 'Ягоды', 'Авокадо', 'Не люблю тыкву'],
  restrictions: ['Без лактозы'],
  skills: ['Базовый уровень', 'Будни: до 30 минут', 'Есть духовка и блендер'],
}

export const recipes: DishId[] = ['oatmeal', 'buckwheatBowl', 'lentilSoup', 'salmon', 'stirFry', 'chickenRice']
