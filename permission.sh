find . -type f -print0 | xargs -0 chmod 644
find . -type d -print0 | xargs -0 chmod 711
chmod 755 public/docs
