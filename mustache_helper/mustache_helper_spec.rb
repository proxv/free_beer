require 'spec_helper'

FIXTURES_DIR = "#{Rails.root}/spec/support/fixtures/mustache"

describe MustacheHelper, "mustache_template" do

  it "should wrap template content in a script tag" do
    tag = helper.mustache_template("#{FIXTURES_DIR}/wisdom/feature_a/feature-a.mustache", FIXTURES_DIR)
    tag.should match('<hello class="cruel">world</hello>')
  end

  it "should create script tag id based on path relative to the relevant template base directory" do
    tag = helper.mustache_template("#{FIXTURES_DIR}/wisdom/feature_a/extra.mustache", FIXTURES_DIR)
    tag.should match('<script id="mustache-wisdom-feature-a-extra" type="text/template-mustache">')
  end

  it "should drop repeats from key when directory and mustache file have same name" do
    tag = helper.mustache_template("#{FIXTURES_DIR}/wisdom/feature_a/feature-a.mustache", FIXTURES_DIR)
    tag.should match('<script id="mustache-wisdom-feature-a" type="text/template-mustache">')
  end

end

describe MustacheHelper, "mustache_all_views" do
  before(:all) { MustacheHelper::WEBAPP_DIR = FIXTURES_DIR }

  it "should include all mustache templates in webapp dir" do
    all = helper.mustache_all_views
    x = Nokogiri.HTML(all)
    puts "tmp -- found #{x.css('script').length} templates"
    x.css('script').length.should == 2
  end
end

