module MustacheHelper
  WEBAPP_DIR ||= "#{Rails.root}/app/assets/webapp"

  def mustache_template(abs_path, base_dir=WEBAPP_DIR)
    if !File.exist?(abs_path)
      logger.error "Could not find mustache template at #{abs_path}"
      return ''
    end
    key = abs_path[(base_dir.length + 1)..-10].gsub('_', '-')
    parts = key.split('/')
    parts.pop if parts[-1] == parts[-2]
    key = parts.join('-')
    content_tag :script, :type => 'text/template-mustache', :id => "mustache-#{key}" do
      raw "\n" + File.read(abs_path).strip + "\n"
    end
  end

  def mustache_all_views
    paths = Dir[("#{WEBAPP_DIR}/**/*.mustache")]
    templates = paths.map { |path| mustache_template(path) }
    raw templates.join("\n\n")
  end

end
