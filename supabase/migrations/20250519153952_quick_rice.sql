/*
  # Case Studies Database Structure
  
  1. New Tables
    - `cases`
      - `id` (uuid, primary key) - unique identifier
      - `title` (text) - case title
      - `slug` (text, unique) - URL-friendly identifier
      - `excerpt` (text) - short description
      - `hero_image` (text) - URL of the cover image
      - `owner_name` (text) - client/business owner name
      - `owner_photo` (text) - URL of owner's photo
      - `metrics` (jsonb) - key performance metrics
      - `content_md` (text) - markdown content of the case study
      - `views` (int) - view counter
      - `published_at` (timestamptz) - publication date
  
  2. Functions
    - `increment_case_view` - Function to increment view count
  
  3. Security
    - Enable RLS on cases table
    - Add policies for public read access
*/

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  hero_image text NOT NULL,
  owner_name text NOT NULL,
  owner_photo text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_md text NOT NULL,
  views int NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_case_view(case_slug text)
RETURNS void AS $$
BEGIN
  UPDATE cases
  SET views = views + 1
  WHERE slug = case_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to cases"
  ON cases
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to update view count
CREATE POLICY "Allow authenticated update of views"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO cases (title, slug, excerpt, hero_image, owner_name, owner_photo, metrics, content_md, published_at)
VALUES 
  (
    'Автосервис "АвтоПрофи": +34% продаж за 2 месяца',
    'avtoprofi-34-percent-growth',
    'Как автосервис увеличил доход с помощью AI-бота в WhatsApp',
    'https://images.pexels.com/photos/3807317/pexels-photo-3807317.jpeg',
    'Алексей Иванов',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    '[{"label": "+34%", "desc": "Рост продаж"}, {"label": "-5ч", "desc": "Экономия времени"}, {"label": "92%", "desc": "Ответов на обращения"}]',
    '## Проблема\n\nСеть автосервисов "АвтоПрофи" обрабатывала все обращения клиентов вручную. Менеджеры не успевали отвечать на сообщения в WhatsApp, из-за чего терялось до 40% потенциальных клиентов.\n\n## Решение Gneiro\n\nМы внедрили AI-бота для WhatsApp, который:\n\n- Стал отвечать на типовые вопросы о ценах и услугах\n- Записывал на ТО и диагностику\n- Автоматически предлагал дополнительные услуги\n\n## Результаты\n\nЗа 2 месяца работы бота:\n\n- Продажи выросли на 34%\n- Время на обработку обращений сократилось на 5 часов в день\n- Клиенты стали получать ответы в течение 3 секунд вместо 2-3 часов',
    '2024-04-10 10:00:00'
  ),
  (
    'Салон красоты "Эстетика": автоматизация записи и +40% повторных визитов',
    'salon-estetika-automation',
    'Как бот помог увеличить загрузку мастеров и снизить количество отмен',
    'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg',
    'Мария Петрова',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    '[{"label": "+40%", "desc": "Повторные визиты"}, {"label": "-62%", "desc": "Отмены записей"}, {"label": "24/7", "desc": "Доступность"}]',
    '## Проблема\n\nСалон красоты "Эстетика" терял клиентов из-за долгого ожидания ответа на запись. Администраторы не успевали обрабатывать все заявки и отправлять напоминания.\n\n## Решение Gneiro\n\nВнедрили бота, который:\n\n- Показывал свободное время у разных мастеров\n- Отправлял напоминания о записи за день и за час\n- Предлагал перенести запись вместо отмены\n\n## Результаты\n\n- Повторные визиты выросли на 40%\n- Количество отмен сократилось на 62%\n- Клиенты могут записаться в любое время суток',
    '2024-04-05 14:30:00'
  ),
  (
    'Интернет-магазин "ТехноМакс": увеличение конверсии в корзине на 28%',
    'tehnomax-cart-conversion',
    'Как ИИ-бот помог покупателям завершать покупки и снизил процент брошенных корзин',
    'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
    'Дмитрий Сидоров',
    'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    '[{"label": "+28%", "desc": "Конверсия корзины"}, {"label": "+15%", "desc": "Средний чек"}, {"label": "-43%", "desc": "Время ответа"}]',
    '## Проблема\n\nИнтернет-магазин "ТехноМакс" сталкивался с высоким процентом брошенных корзин. Покупатели задавали вопросы, но не получали быстрых ответов.\n\n## Решение Gneiro\n\nВнедрили бота с функциями:\n\n- Мгновенные ответы на вопросы о товарах\n- Помощь с оформлением заказа в WhatsApp\n- Интеграция с платежной системой\n\n## Результаты\n\n- Конверсия брошенных корзин выросла на 28%\n- Средний чек увеличился на 15%\n- Время ответа сократилось с 1 часа до 3 секунд',
    '2024-03-28 09:15:00'
  ),
  (
    'Онлайн-школа "ПрогрессУМ": +56% конверсии в продажу курсов',
    'progressum-sales-conversion',
    'Как бот в WhatsApp стал эффективнее менеджеров в продаже образовательных программ',
    'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg',
    'Елена Смирнова',
    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    '[{"label": "+56%", "desc": "Конверсия в продажу"}, {"label": "24/7", "desc": "Поддержка студентов"}, {"label": "+210", "desc": "Заявок в день"}]',
    '## Проблема\n\nОнлайн-школа "ПрогрессУМ" не справлялась с потоком заявок. Менеджеры не могли качественно прогревать каждого лида.\n\n## Решение Gneiro\n\nВнедрили бота, который:\n\n- Отвечает на частые вопросы о программах\n- Проводит первичный прогрев и квалификацию лидов\n- Предоставляет бесплатные материалы и ведет к продаже\n\n## Результаты\n\n- Конверсия из заявки в продажу выросла на 56%\n- Студенты получают поддержку круглосуточно\n- Количество обрабатываемых заявок выросло до 210 в день',
    '2024-03-15 16:45:00'
  ),
  (
    'Медицинский центр "ЗдравПлюс": снижение нагрузки на регистратуру на 68%',
    'zdravplus-registration-automation',
    'Как AI-бот помог медцентру автоматизировать запись на анализы и прием к врачам',
    'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg',
    'Игорь Ковалев',
    'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    '[{"label": "-68%", "desc": "Нагрузка на регистратуру"}, {"label": "+23%", "desc": "Повторные посещения"}, {"label": "98%", "desc": "Довольных клиентов"}]',
    '## Проблема\n\nМедицинский центр "ЗдравПлюс" сталкивался с перегруженной телефонной линией. Пациенты ждали ответа регистратора по 15-20 минут.\n\n## Решение Gneiro\n\nВнедрили бота, который:\n\n- Записывает на прием к врачу через WhatsApp\n- Уточняет симптомы и подбирает специалиста\n- Напоминает о визите и направляет на анализы\n\n## Результаты\n\n- Нагрузка на регистратуру снизилась на 68%\n- Повторные посещения выросли на 23%\n- 98% пациентов довольны новой системой записи',
    '2024-03-01 11:30:00'
  );