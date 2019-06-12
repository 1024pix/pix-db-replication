require 'rubygems'
require 'rufus-scheduler'
scheduler = Rufus::Scheduler.new

scheduler.cron ENV['SCHEDULE'], overlap: false do
  system 'curl -O https://cli-dl.scalingo.io/install && bash install -i "$PWD"'

  addonid=`./scalingo addons`.split("\n").grep(/Postg/).first.split("|")[2].strip

  puts "Add-on ID: #{addonid}"

  backupid=`./scalingo --addon #{addonid} backups`.split("\n").grep(/done/).first.split("|")[1].strip

  puts "Backup ID: #{backupid}"

  system "./scalingo --addon #{addonid} backup-download --backup #{backupid} -o backup.tar.gz"

  if File.size("backup.tar.gz") <= 0
    exit 2
  end

  system "psql \"$DATABASE_URL\" -c 'DROP OWNED BY CURRENT_USER CASCADE'"

  system "tar xvzf ./backup.tar.gz"

  backupfile = Dir.glob("*.pgsql").first

  system "pg_restore #{backupfile} --verbose --jobs=4 --no-owner -d \"$DATABASE_URL\""
end

scheduler.join
