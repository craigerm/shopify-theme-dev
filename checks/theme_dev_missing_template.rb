# frozen_string_literal: true
module ThemeCheck
  # Reports missing include/render/section liquid file
  class ThemeDevMissingTemplate < LiquidCheck
    severity :error
    category :liquid
    single_file false

    def initialize(ignore_missing: [])
      @ignore_missing = ignore_missing
    end

    def on_include(node)
      snippet = node.value.template_name_expr
      if snippet.is_a?(String)
        add_missing_offense(snippet, node: node, type: :snippet)
      end
    end

    alias_method :on_render, :on_include

    def on_section(node)
      section = node.value.section_name
      add_missing_offense(section, node: node, type: :section)
    end

    private

    def ignore?(path)
      all_ignored_patterns.any? { |pattern| File.fnmatch?(pattern, path) }
    end

    def all_ignored_patterns
      @all_ignored_patterns ||= @ignore_missing + ignored_patterns
    end

    def add_missing_offense(name, node:, type:)
      if type == :snippet
        names = ["snippets/#{name}"]
      else
        names = ["sections/_#{name}", "sections/#{name}"]
      end

      match = names.find { |name| ignore?("#{name}.liquid") || theme[name] }
      return if match

      add_offense("'#{name}.liquid' is not found", node: node) do |corrector|
        corrector.create_file(@theme.storage, "#{name}.liquid", "")
      end
    end
  end
end
