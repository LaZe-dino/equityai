-- Notifications table for user alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('interest_received', 'interest_accepted', 'interest_declined', 'offering_live', 'offering_funded', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast unread queries
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create notification on interest received
CREATE OR REPLACE FUNCTION notify_interest_received()
RETURNS TRIGGER AS $$
DECLARE
  founder_id UUID;
  offering_title TEXT;
  investor_name TEXT;
BEGIN
  -- Get founder ID and offering title
  SELECT c.founder_id, o.title
  INTO founder_id, offering_title
  FROM offerings o
  JOIN companies c ON o.company_id = c.id
  WHERE o.id = NEW.offering_id;

  -- Get investor name
  SELECT full_name INTO investor_name
  FROM profiles
  WHERE id = NEW.investor_id;

  -- Create notification for founder
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    founder_id,
    'interest_received',
    'New Interest in Your Offering',
    investor_name || ' expressed interest in "' || offering_title || '"',
    '/dashboard/interests'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for interest notifications
DROP TRIGGER IF EXISTS interest_received_trigger ON interests;
CREATE TRIGGER interest_received_trigger
  AFTER INSERT ON interests
  FOR EACH ROW
  EXECUTE FUNCTION notify_interest_received();

-- Function to create notification on interest status change
CREATE OR REPLACE FUNCTION notify_interest_status_change()
RETURNS TRIGGER AS $$
DECLARE
  offering_title TEXT;
BEGIN
  IF OLD.status != NEW.status AND NEW.status IN ('accepted', 'declined') THEN
    SELECT o.title INTO offering_title
    FROM offerings o
    WHERE o.id = NEW.offering_id;

    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.investor_id,
      CASE WHEN NEW.status = 'accepted' THEN 'interest_accepted' ELSE 'interest_declined' END,
      CASE WHEN NEW.status = 'accepted' THEN 'Interest Accepted!' ELSE 'Interest Declined' END,
      'Your interest in "' || offering_title || '" was ' || NEW.status,
      '/dashboard/offers'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for interest status changes
DROP TRIGGER IF EXISTS interest_status_trigger ON interests;
CREATE TRIGGER interest_status_trigger
  AFTER UPDATE ON interests
  FOR EACH ROW
  EXECUTE FUNCTION notify_interest_status_change();
